import { themes } from '@digg/design-system';
import createEmotionServer from 'create-emotion-server';
import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/core'
import { ThemeProvider } from 'emotion-theming';
import fetch from 'node-fetch';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { Helmet } from 'react-helmet';  
import { FilledContext, HelmetProvider } from 'react-helmet-async';
import { StaticRouter } from 'react-router';
import { RouterContext } from '../../shared/RouterContext';
import { SettingsProvider } from '../../src/components/SettingsProvider';
import { LocalStoreProvider } from '../../src/components/LocalStoreProvider';
import { Routes } from '../../src/routes';
import { getBundles, getStyleBundles } from './getBundles';
import { getFooter, getHeader } from './html-template';
import { GlobalStyles } from '../../src/GlobalStyles';

export interface RenderResponseProfileItem {
  name: string;
  duration: number;
}

export interface RenderResponse {
  statusCode: number;
  error?: any;
  body?: string;
  redirectTo?: string | null;
  profile: RenderResponseProfileItem[];
}

export const renderer = async (
  host: string,
  path: string,
  manifestPath: string,
  cookies: string,
  apiUrl: string,
  formdata?: object,
  vars?: object
): Promise<RenderResponse> => {
  const profile: RenderResponseProfileItem[] = [];  

  let start = 0;
  let end = 0;

  let routerContext: RouterContext = {};
  let helmetContext: FilledContext | any = {};

  const cache = createCache()
  const { extractCritical } = createEmotionServer(cache)

  const frontend = (
    <CacheProvider value={cache}>
      <GlobalStyles theme={themes.default} />
      <ThemeProvider theme={themes.opendata}>
        <HelmetProvider context={helmetContext}>       
          <LocalStoreProvider>
            <SettingsProvider applicationUrl={host}>
              <StaticRouter location={path} context={routerContext}>
                <Routes formdata={formdata} vars={vars} />
              </StaticRouter>
            </SettingsProvider>
          </LocalStoreProvider>       
        </HelmetProvider>
      </ThemeProvider>      
    </CacheProvider>
  );

  try {
    const bundlesPromise = getBundles(manifestPath);    
    const styleBundlesPromise = getStyleBundles(manifestPath);    

    if (routerContext.url) {
      return {
        statusCode: 301,
        redirectTo: routerContext.url,
        profile,
      };
    }

    const { helmet } = helmetContext as FilledContext;    

    const bundles: string[] = await bundlesPromise;    
    const styleBundles: string[] = await styleBundlesPromise;    

    let response = getHeader({
      metaTags: helmet
        ? `${helmet.title.toString()}${helmet.meta.toString()}${helmet.link.toString()}`
        : '',
      bundles,  
      styleBundles,    
      htmlAttributes: 'lang="sv"',
    });

    start = Date.now();
    const { html, ids, css } = extractCritical(renderToString(frontend));

    end = Date.now();

    profile.push({ name: 'Render Body', duration: end - start });

    if(!helmet)
    {
      const helmetServer = Helmet.renderStatic();
      response += `${helmetServer.title.toString()}${helmetServer.meta.toString()}${helmetServer.link.toString()}`;      
    }

    response += `<style data-emotion-css>${css}</style></head>`;

    response += `<body><div id="root">${html}</div>`;

    response += getFooter({ bundles, ids });

    return {
      statusCode: routerContext.statusCode || 200,
      body: response,
      profile,
    };
  } catch (e) {
    console.error(e);
    return {
      statusCode: 500,
      error: { message: e.message, stack: e.stack, name: e.name },
      profile,
    };
  }

  return {
    statusCode: 500,
    profile,
  };
};
