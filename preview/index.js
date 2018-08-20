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
import { CopyToClipboard } from "react-copy-to-clipboard";
import { ToastContainer, toast } from "react-toastify";

import "react-toastify/dist/ReactToastify.css";

const IconHit = ({ hit }) => (
  <CopyToClipboard
    text={hit.componentName}
    onCopy={() => {
      toast("Component name copied to clipboard!");
    }}
  >
    <div className="IconHit">
      <div className="IconHit-icon" dangerouslySetInnerHTML={{ __html: hit.svg }} />
      <Highlight className="IconHit-name" attribute="name" hit={hit} />
      <span className="IconHit-theme">({hit.theme})</span>
    </div>
  </CopyToClipboard>
);

class App extends React.Component {
  render() {
    return (
      <InstantSearch appId="K7NSWJYFK0" apiKey="6c8d7f6e3e6627a946459e7be11d133a" indexName="react-md-icon">
        <Configure hitsPerPage={40} />
        <div className="content">
          <h1>react-md-icon</h1>

          <div className="section sharing">
            <Share url="https://react-md-icon.netlify.com/" />
            <Follow username="mrkombu" />
          </div>

          <div className="section">
            Get the latest material icons ! <br />
            <a href="#install">Learn how to use it</a>.
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

          <div id="install" className="section">
            <h2>Install it</h2>
            <code className="code">{`npm install react-md-icon`}</code>
          </div>

          <div className="section">
            <h2>Use it</h2>
            <iframe
              src="https://codesandbox.io/embed/z3y480kv73"
              style={{ width: "100%", height: 500, border: 0, borderRadius: 4, overflow: "hidden" }}
              sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"
            />
          </div>

          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar
            newestOnTop={false}
            pauseOnVisibilityChange={false}
            draggable={false}
            pauseOnHover={false}
          />
        </div>
      </InstantSearch>
    );
  }
}

render(<App />, document.getElementById("root"));
