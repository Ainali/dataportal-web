import { Box } from '@digg/design-system';
import React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import 'url-search-params-polyfill';
import { RouterContext } from '../../../shared/RouterContext';
import { ErrorBoundary } from '../../components/ErrorBoundary';
import { Footer } from '../../components/Footer';
import { Header } from '../../components/Header';
import { NoJavaScriptWarning } from '../../components/NoJavaScriptWarning';
import { QueryParamProvider } from '../../components/QueryParamProvider';
import { __RouterContext } from 'react-router';
import { Link } from 'react-router-dom';
import { PageMetadata } from '../PageMetadata';
import { encode, decode } from 'qss';
import { Loader } from '../../components/Loader';
import i18n from 'i18n';
import { EnvSettings } from '../../../config/env/EnvSettings';

const MainContent = Box.withComponent('main');

export interface PageProps extends RouteComponentProps<any, RouterContext> {
  env: EnvSettings;
}

export class DataSetPage extends React.Component<
  PageProps,
  { scriptsAdded: Boolean; scriptsLoaded: Boolean }
> {
  private headerRef: React.RefObject<Header>;
  private postscribe: any;

  constructor(props: PageProps) {
    super(props);
    this.headerRef = React.createRef();
    this.setFocus = this.setFocus.bind(this);
  }

  /**
   * Async load scripts requiered for EntryScape blocks,
   * or else blocks wont have access to DOM
   */
  componentDidMount() {
    this.addScripts();
  }

  addScripts() {
    if (typeof window !== 'undefined') {
      let reactThis = this;

      this.postscribe = (window as any).postscribe;

      if (this.props.match.params.eid && this.props.match.params.cid) {
        this.postscribe(
          '#scriptsPlaceholder',
          ` 
          <script>
          var __entryscape_plugin_config = {
            entrystore_base: 'https:\/\/${this.props.env.ENTRYSCAPE_DATASETS_PATH? this.props.env.ENTRYSCAPE_DATASETS_PATH : 'registrera.oppnadata.se' }\/store'          
          };
          window.__entryscape_config = {
            page_language: '${i18n.languages[0]}',
            entry: '${this.props.match.params.eid}', 
            context: '${this.props.match.params.cid}'
          }
          </script>                      
          <script src="${this.props.env.ENTRYSCAPE_BLOCKS_URL? this.props.env.ENTRYSCAPE_BLOCKS_URL : 'https://dataportal.azureedge.net/cdn/blocks.0.18.2.app.js'}"></script>                  
          `,
          {
            done: function() {},
          }
        );
      }
    }
  }

  setFocus() {
    if (this.headerRef.current) {
      this.headerRef.current.setFocusOnMenuButton();
    }
  }

  render() {
    const { location } = this.props;
    let uri = new URLSearchParams(location.search);

    return (
      <QueryParamProvider params={uri}>
        <PageMetadata
          seoTitle="Datamängd - Sveriges dataportal"
          seoDescription=""
          seoImageUrl=""
          seoKeywords=""
          robotsFollow={true}
          robotsIndex={true}
          lang={i18n.languages[0]}
        />
        <Box
          id="top"
          display="flex"
          direction="column"
          minHeight="100vh"
          bgColor="#fff"
        >
          <NoJavaScriptWarning text="" />

          <Header ref={this.headerRef} />

          <ErrorBoundary>
            <MainContent flex="1 1 auto">
              <div className="main-container">
                <div
                  className="col span_8 boxed dataset"
                  data-animation=""
                  data-delay="0"
                >                  
                  {/* {(this.props.history && this.props.history.length > 0 &&
                    <a onClick={() => this.props.history.goBack()} className="back-to-search">
                      Tillbaka
                    </a>
                  )} */}

                  {/* <span className="bottom-line"></span> */}

                  <script
                    type="text/x-entryscape-handlebar"
                    data-entryscape="true"
                    data-entryscape-component="template"
                    dangerouslySetInnerHTML={{
                      __html: `
                      <span>{{#eachprop "dcat:theme"}}<span class="tema md5_{{md5}}">{{label}}</span>{{/eachprop}}</span>
                      `,
                    }}
                  ></script>

                  <script
                    type="text/x-entryscape-handlebar"
                    data-entryscape="true"
                    data-entryscape-component="template"
                    dangerouslySetInnerHTML={{
                      __html: `
                      <h1>{{ text }}</h1>
                      `,
                    }}
                  ></script>

                  <script
                    type="text/x-entryscape-handlebar"
                    data-entryscape="true"
                    data-entryscape-component="template"
                    dangerouslySetInnerHTML={{
                      __html: `
                      <div class="publisher-name">
                      <p class="text-5">
                        {{text relation="dcterms:publisher"}} 
                      <p>
                      `,
                    }}
                  ></script>

                  <script
                    type="text/x-entryscape-handlebar"
                    data-entryscape="true"
                    data-entryscape-component="template"
                    dangerouslySetInnerHTML={{
                      __html: `
                      <div class="description">{{text content="\${dcterms:description}"}}</div>
                      `,
                    }}
                  ></script>

                  <script
                    type="text/x-entryscape-handlebar"
                    data-entryscape="true"
                    data-entryscape-component="template"
                    dangerouslySetInnerHTML={{
                      __html: `
                    
                    {{#ifprop "dcat:theme"}} 
                    
                    {{/ifprop}}
                    {{#list relation="dcat:distribution" template="dcat:OnlyDistribution" onecol="true" expandTooltip="Mer information" unexpandTooltip="Mindre information"}}
                          
                    
                          {{{{listbody}}}}
                            <div class="formats">{{body}}</div>
                          {{{{/listbody}}}}


                          {{{{listplaceholder}}}}
                            <div class="alert alert-info" role="alert">Denna datamängd har inga dataresurser angivna</div>
                          {{{{/listplaceholder}}}}


                          {{{{listhead}}}}
                            <h2 class="text-3">Hämta data</h2>
                          {{{{/listhead}}}}


                          {{{{rowhead}}}}
                            
                            {{#ifprop "dcat:downloadURL"}}
                              <a aria-label="Ladda ned distribution" href=\'{{prop "dcat:downloadURL"}}\' class="pull-right btn btn-sm btn-default" role="button" target="_blank"> Ladda ned</a>                              
                            {{/ifprop}}                                                                                
                           
                           
                            <div class="accordion-col">
                              <span title="Titel på distribution" class="resourceLabel">{{text fallback="<span class=\'distributionNoName\'>Ingen titel given</span>"}}</span>
                              <span title="Licens" class="licence text-5">
                              {{prop "dcterms:license" render="label"}}
                              </span>

                              <div class="format-div">
                                  <span title="Format" class="format label formatLabel label-success md5_{{prop "dcterms:format" render="md5"}}"
                                  title="{{prop "dcterms:format"}}">{{prop "dcterms:format" render="label"}}</span>\
                              </div>

                              </div>

                            {{{{/rowhead}}}}

                    {{/list}}
                    <h2 class="about-header">Om datamängd</h2>
                    <div class="viewMetadata">
                      {{viewMetadata 
                          template="dcat:OnlyDataset" 
                          filterpredicates="dcterms:title,dcterms:description,dcterms:publisher,dcat:theme"}}
                    </div>
                    `,
                    }}
                  ></script>
                </div>

                <div
                  className="col span_4 boxed about-dataset"
                  data-animation=""
                  data-delay="0"
                >
                  <span className="bottom-line"></span>
                  <div className="information-row">
                    <script
                      type="text/x-entryscape-handlebar"
                      data-entryscape="true"
                      data-entryscape-block="template"
                      dangerouslySetInnerHTML={{
                        __html: `
                        <span class="organisation-span">Organisation</span>
                      `,
                      }}
                    ></script>
                    <span
                      className="entryscape org-name"
                      data-entryscape="true"
                      data-entryscape-block="text"
                      data-entryscape-relation="dcterms:publisher"
                      data-entryscape-define="_org"
                    >
                      {/* <Loader /> */}
                    </span>
                  </div>
                  <span
                    className="entryscape"
                    data-entryscape="true"
                    data-entryscape-block="view"
                    data-entryscape-template="dcat:foaf:Agent"
                    data-entryscape-filterpredicates="foaf:name"
                    data-entryscape-use="_org"
                  ></span>

                  <div className="information-row">
                    <script
                      type="text/x-entryscape-handlebar"
                      data-entryscape="true"
                      data-entryscape-block="template"
                      dangerouslySetInnerHTML={{
                        __html: `<span class="catalog-span">Hämtad från katalog</span><span class="catalog-name">{{text relationinverse="dcat:dataset" define="cat"}}</span>`,
                      }}
                    ></script>
                  </div>

                  <script
                    type="text/x-entryscape-handlebar"
                    data-entryscape="true"
                    data-entryscape-block="template"
                    dangerouslySetInnerHTML={{
                      __html: `{{viewMetadata 
                          relationinverse="dcat:dataset" 
                          onecol=true 
                          template="dcat:OnlyCatalog" 
                          use="cat" 
                          filterpredicates="dcterms:title"}}`,
                    }}
                  ></script>

                  <script
                    type="text/x-entryscape-handlebar"
                    data-entryscape="true"
                    data-entryscape-block="template"
                    dangerouslySetInnerHTML={{
                      __html: `
                    <a class="download-rdf" target="_blank" href="{{metadataURI}}?recursive=dcat">Ladda ner som RDF</a>
                    `,
                    }}
                  ></script>
                </div>
              </div>
            </MainContent>
          </ErrorBoundary>
          <Footer onToTopButtonPushed={this.setFocus} />
        </Box>
      </QueryParamProvider>
    );
  }
}
