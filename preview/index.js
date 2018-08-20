import React from "react";
import { render } from "react-dom";
import * as mdIcons from "../dist/index.js";

class App extends React.Component {
  render() {
    return (
      <div>
        <h1>react-md-icon</h1>
        <div id="icon-container">
          {Object.keys(mdIcons).map(iconName => {
            const Icon = mdIcons[iconName];
            return <Icon id={iconName} key={iconName} />;
          })}
        </div>
      </div>
    );
  }
}

render(<App />, document.getElementById("root"));
