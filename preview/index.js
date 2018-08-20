import React from "react";
import { render } from "react-dom";
import {
  InstantSearch,
  SearchBox,
  Hits,
  Menu,
  Pagination,
  Highlight,
  Configure,
  PoweredBy
} from "react-instantsearch-dom";
import { Follow, Share } from "react-twitter-widgets";

import SyntaxHighlighter, { registerLanguage } from "react-syntax-highlighter/light";
import js from "react-syntax-highlighter/languages/hljs/javascript";
import shell from "react-syntax-highlighter/languages/hljs/shell";
import monokai from "react-syntax-highlighter/styles/hljs/monokai";

registerLanguage("javascript", js);
registerLanguage("shell", shell);

const IconHit = ({ hit }) => (
  <div className="IconHit">
    <div className="IconHit-icon" dangerouslySetInnerHTML={{ __html: hit.svg }} />
    <Highlight className="IconHit-name" attribute="name" hit={hit} />
    <span className="IconHit-theme">({hit.theme})</span>
  </div>
);

class App extends React.Component {
  render() {
    return (
      <InstantSearch appId="K7NSWJYFK0" apiKey="6c8d7f6e3e6627a946459e7be11d133a" indexName="react-md-icon">
        <Configure hitsPerPage={40} />
        <div className="content">
          <div className="header">
            <h1>react-md-icon </h1>
            <Share url="https://react-md-icon.netlify.com/" />
            <Follow username="mrkombu" />
          </div>

          <p className="section">Get the latest material icons !</p>

          <div className="section">
            <h2>Install it</h2>
            <SyntaxHighlighter className="code" language="shell" style={monokai}>
              {`npm install react-md-icon`}
            </SyntaxHighlighter>
          </div>

          <div className="section">
            <h2>Icons</h2>

            <SearchBox autoFocus placeholder="Search icon names..." />
            <div className="filters">
              <Menu attribute="theme" operator="and" />
              <PoweredBy />
            </div>
          </div>

          <div className="section">
            <Hits hitComponent={IconHit} />
          </div>

          <div className="section">
            <Pagination />
          </div>

          <div className="section">
            <h2>Use it</h2>
            <iframe
              src="https://codesandbox.io/embed/z3y480kv73"
              style={{ width: "100%", height: 500, border: 0, borderRadius: 4, overflow: "hidden" }}
              sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"
            />
          </div>
        </div>
      </InstantSearch>
    );
  }
}

render(<App />, document.getElementById("root"));
