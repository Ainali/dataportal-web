import { Box, SearchIcon, Button, CloseIcon } from '@digg/design-system';
import React from 'react';
import 'url-search-params-polyfill';
import { ErrorBoundary } from '../../components/ErrorBoundary';
import { Footer } from '../../components/Footer';
import { Header } from '../../components/Header';
import { NoJavaScriptWarning } from '../../components/NoJavaScriptWarning';
import { QueryParamProvider } from '../../components/QueryParamProvider';
import { __RouterContext } from 'react-router';
import {
  SearchContext,
  SearchContextData,
  SearchProvider,
} from '../../components/Search';
import {
  SearchFacetValue,
  SearchRequest,
} from '../../components/Search/Search';
import { decode } from 'qss';
import { PageMetadata } from '../PageMetadata';
import { RouteComponentProps } from 'react-router-dom';
import { RouterContext } from '../../../shared/RouterContext';
import { SearchFilter } from '../../components/SearchFilter';
import { Loader } from '../../components/Loader';
import { SearchHeader } from 'components/SearchHead';
import { ESRdfType, ESType } from 'components/Search/EntryScape';
import i18n from 'i18n';
import { EnvSettings } from '../../../config/env/EnvSettings';

const MainContent = Box.withComponent('main');

interface SearchProps extends RouteComponentProps<any, RouterContext> {
  activeLink?: string;
  env: EnvSettings;
}

export class SearchSpecificationsPage extends React.Component<
  SearchProps,
  any
> {
  private headerRef: React.RefObject<Header>;
  private searchRef: React.RefObject<SearchHeader>;
  private inputQueryRef: React.RefObject<HTMLInputElement>;

  constructor(props: SearchProps) {
    super(props);
    this.headerRef = React.createRef();
    this.searchRef = React.createRef();
    this.setFocus = this.setFocus.bind(this);
    this.inputQueryRef = React.createRef();
    this.state = { query: '*', activeLink: 'search', showFilters: false };
    this.state = { activeLink: 'specifications' };
  }

  setFocus() {
    if (this.headerRef.current) {
      this.headerRef.current.setFocusOnMenuButton();
    }
  }

  searchFocus() {
    let content = document.querySelector('#search-result');
    if (!content) return;

    const focusable = content.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const first = focusable[0];

    if (first) {
      first.focus();
    }
  }

  setTopMargin(height: number) {
    this.setState({ headerHeight: height });
  }

  componentDidMount() {
    //needed for handling back/forward buttons and changing state for input correctly
    if (typeof window !== 'undefined') {
      //handles back/forward button
      window.addEventListener('popstate', () => {
        var qs = decode(window.location.search.substring(1)) as any;
        let querytext =
          qs.q && qs.q.toString().length > 0 ? qs.q.toString() : '';

        if (querytext) this.setState({ query: querytext });
      });

      //*** makes sure querytext is set from location to input, on page reloads
      var qs = decode(window.location.search.substring(1)) as any;
      let querytext = qs.q && qs.q.toString().length > 0 ? qs.q.toString() : '';

      if (querytext)
        this.setState({
          query: decodeURIComponent(querytext.replace(/\+/g, '%20')),
        });

      //***
    }
  }

  componentDidUpdate() {
    if (typeof window !== 'undefined') {
      window.scrollTo(0, 0);
    }
  }

  handleChange = (target: any) => {
    this.setState({ query: target.value });
  };

  toggleShowOrHide = () => {
    this.setState({ showFilter: !this.state.showFilter });
  };

  render() {
    const { location } = this.props;
    let uri = new URLSearchParams(location.search);

    return (
      <QueryParamProvider params={uri}>
        <SearchProvider
          hitSpecification={{
            path: `/${i18n.languages[0]}/specifications/`,
            titleResource: 'dcterms:title',
            descriptionResource: 'dcterms:description',
          }}
          facetSpecification={{
            facets: [
              { resource: 'http://www.w3.org/ns/dcat#theme', type: ESType.uri },
              {
                resource: 'http://purl.org/dc/terms/publisher',
                type: ESType.uri,
              },
            ],
          }}
          entryscapeUrl= {this.props.env.ENTRYSCAPE_SPECS_PATH? `https://${this.props.env.ENTRYSCAPE_SPECS_PATH}/store`: 'https://editera.dataportal.se/store'}
          initRequest={{
            esRdfTypes: [ESRdfType.spec_standard, ESRdfType.spec_profile],
            takeFacets: 30,
          }}
        >
          <PageMetadata
            seoTitle={`${i18n.t('routes|specifications|title')} - ${i18n.t(
              'common|logo-title'
            )}`}
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

            <Header ref={this.headerRef} activeLink={this.state.activeLink} />

            <ErrorBoundary>
              <MainContent id="main" flex="1 1 auto">
                <SearchContext.Consumer>
                  {search => (
                    <div className="wpb_wrapper">
                      <div className="main-container">
                        <h1 className="text-2 search-header">
                          {i18n.t('common|search-data')}
                        </h1>

                        <SearchHeader
                          ref={this.headerRef}
                          activeLink={this.state.activeLink}
                        />

                        <form
                          onSubmit={event => {
                            event.preventDefault();
                            search
                              .set({
                                page: 0,
                                query: this.inputQueryRef.current!.value || '*',
                                fetchFacets: true,
                              })
                              .then(() => search.doSearch());
                          }}
                        >
                          <div className="search-box">
                            <label
                              className="screen-reader"
                              htmlFor="search-field"
                            >
                              {i18n.t('pages|concept|search-concept')}
                            </label>
                            <input
                              id="search-field"
                              autoComplete="off"
                              name="q"
                              ref={this.inputQueryRef}
                              type="text"
                              placeholder={i18n.t(
                                'pages|specifications|search-specifications'
                              )}
                              value={this.state.query}
                              onChange={this.handleChange}
                              key={
                                search.request.query ? 'loaded' : 'not loaded'
                              }
                            ></input>
                            <button
                              type="submit"
                              aria-label={i18n.t(
                                'pages|concept|search-concept'
                              )}
                            >
                              <SearchIcon width={[25]} />
                            </button>
                            {search.loadingFacets && <Loader />}
                          </div>
                        </form>

                        <div className="mobile-filters">
                          <button
                            className={
                              this.state.showFilter ? 'filter-active' : ''
                            }
                            onClick={this.toggleShowOrHide}
                          >
                            {this.state.showFilter
                              ? `${i18n.t('common|hide-filter')}`
                              : `${i18n.t('common|show-filter')}`}
                          </button>
                        </div>

                        <div
                          className={
                            'search-filter-box' +
                            (this.state.showFilter ? ' show-filter' : '')
                          }
                        >
                          {search.allFacets &&
                            Object.entries(search.allFacets).map(
                              ([key, value]) => (
                                <Box
                                  key={'box' + value.title}
                                  className="search-filter"
                                >
                                  <SearchFilter title={value.title}>
                                    <div className="search-filter-list">
                                      {value &&
                                        value.facetValues &&
                                        (value.facetValues as SearchFacetValue[])
                                          .slice(0, value.show || 20)
                                          .map(
                                            (
                                              facetValue: SearchFacetValue,
                                              index: number
                                            ) => (
                                              <Button
                                                key={index}
                                                className={
                                                  search.facetSelected(
                                                    key,
                                                    facetValue.resource
                                                  )
                                                    ? 'selected'
                                                    : ''
                                                }
                                                onClick={() => {
                                                  search
                                                    //Stäng filter här

                                                    .toggleFacet(facetValue)
                                                    .then(() => {
                                                      search
                                                        .doSearch(
                                                          false,
                                                          true,
                                                          false
                                                        )
                                                        .then(() => {
                                                          search.sortAllFacets(
                                                            key
                                                          );
                                                        });
                                                    });
                                                }}
                                              >
                                                {facetValue.title ||
                                                  facetValue.resource}{' '}
                                                ({facetValue.count}){' '}
                                                {search.facetSelected(
                                                  key,
                                                  facetValue.resource
                                                ) && (
                                                  <span className="right">
                                                    <CloseIcon width={[18]} />
                                                  </span>
                                                )}
                                              </Button>
                                            )
                                          )}
                                      {value.facetValues.length >
                                        value.show && (
                                        <Button
                                          onClick={() => {
                                            search.fetchMoreFacets(key);
                                          }}
                                        >
                                          {search.loadingFacets
                                            ? `${i18n.t('common|loading')}...`
                                            : `${i18n.t('common|load-more')}...`}
                                        </Button>
                                      )}
                                    </div>
                                  </SearchFilter>
                                </Box>
                              )
                            )}
                        </div>

                        <div className="selected-filters">
                          {search.request &&
                            search.request.facetValues &&
                            (search.request
                              .facetValues as SearchFacetValue[]).map(
                              (facetValue: SearchFacetValue, index: number) => (
                                <button
                                  key={index}
                                  className="selectedfilter"
                                  onClick={() => {
                                    search.toggleFacet(facetValue).then(() => {
                                      search.doSearch().finally(() => {
                                        search.sortAllFacets();
                                      });
                                    });
                                  }}
                                >
                                  {facetValue.title || facetValue.resource}{' '}
                                  <CloseIcon width={[15]} />
                                </button>
                              )
                            )}
                        </div>
                        <div
                          className={
                            'clear-filters' +
                            (search.request &&
                            search.request.facetValues &&
                            search.request.facetValues.length >= 2
                              ? ' show'
                              : '')
                          }
                        >
                          <button
                            onClick={() => {
                              search
                                .set({
                                  facetValues: [],
                                })
                                .then(() => {
                                  search.doSearch();
                                });
                            }}
                          >
                            {i18n.t('common|clear-filters')}
                            (
                            {search.request &&
                              search.request.facetValues &&
                              search.request.facetValues.length}
                            )
                          </button>
                        </div>

                        <noscript>{i18n.t('common|no-js-text')}</noscript>

                        <div id="search-result" className="search-result">
                          <h2 className="text-4 search-result-header">
                            {search.loadingHits
                              ? `${i18n.t('common|loading')}...`
                              : `${search.result.count} ${i18n.t(
                                  'pages|search|specification-hits'
                                )}`}{' '}
                          </h2>
                          <div>
                            <ul className="search-result-list">
                              {search.result.hits &&
                                search.result.hits.map((hit, index) => (
                                  <li
                                    className="specification search-result-list-item"
                                    key={index}
                                    onClick={() => {
                                      (window as any).location.href = hit.url;
                                    }}
                                  >
                                    <a href={`${hit.url}`}>
                                      <h3 className="text-3">{hit.title}</h3>
                                    </a>
                                    <p className="text-6">{hit.description}</p>
                                  </li>
                                ))}
                            </ul>
                          </div>
                        </div>

                        {(search.result.pages || 0) > 1 && (
                          <div className="pagination">
                            <div className="first-page">
                              {(search.request.page || 0) > 1 && (
                                <button
                                  className="first-page-btn"
                                  onClick={() => {
                                    search
                                      .set({
                                        page: 0,
                                      })
                                      .then(() => search.doSearch());
                                    window.scrollTo({
                                      top: 0,
                                      behavior: 'smooth',
                                    });
                                    this.searchFocus();
                                  }}
                                >
                            {i18n.t('pages|search|first-page')}
                                </button>
                              )}
                            </div>

                            <div className="prev-next-page">
                              <button
                                disabled={(search.request.page || 0) === 0}
                                className=""
                                onClick={() => {
                                  search
                                    .set({
                                      page: (search.request.page || 0) - 1,
                                    })
                                    .then(() => search.doSearch());
                                  window.scrollTo({
                                    top: 0,
                                    behavior: 'smooth',
                                  });
                                  this.searchFocus();
                                }}
                              >
                                {i18n.t('pages|search|prev-page')}
                              </button>
                              <span>
                                {i18n.t('pages|search|page')}{' '}
                                {(search.request.page || 0) + 1}{' '}
                                {i18n.t('common|of')} {search.result.pages}
                              </span>
                              <button
                                className=""
                                disabled={
                                  (search.result.pages || 1) ===
                                  (search.request.page || 0) + 1
                                }
                                onClick={() => {
                                  search
                                    .set({
                                      page: (search.request.page || 0) + 1,
                                    })
                                    .then(() => search.doSearch());
                                  window.scrollTo({
                                    top: 0,
                                    behavior: 'smooth',
                                  });
                                  this.searchFocus();
                                }}
                              >
                                {i18n.t('pages|search|next-page')}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </SearchContext.Consumer>
              </MainContent>
            </ErrorBoundary>
            <Footer onToTopButtonPushed={this.setFocus} />
          </Box>
        </SearchProvider>
      </QueryParamProvider>
    );
  }
}
