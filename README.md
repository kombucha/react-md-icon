# react-md-icons

Use the latest material icon in your React application.

---

[react-icons](https://github.com/react-icons/react-icons) is great but out of date because [material-design-icons](https://github.com/google/material-design-icons) is out of date...
So I built this script to use the latest material icons in React !

## Install

```sh
npm install react-md-icon
```

## Usage

Play with it in [codesandbox](https://codesandbox.io/s/z3y480kv73)

Example :

```jsx
import React from "react";
import ReactDOM from "react-dom";
import RoundWhatshot from "react-md-icon/dist/RoundWhatshot";

ReactDOM.render(
  () => (
    <RoundWhatshot
      style={{
        fontSize: "10em",
        color: "purple"
      }}
    />
  ),
  document.body
);
```
