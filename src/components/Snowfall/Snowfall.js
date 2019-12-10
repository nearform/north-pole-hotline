import React from "react";

import "./Snowfall.css";

function Snowfall(props) {
  return (
    <div style={{ backgroundColor: "#9ed2ec" }}>
      <div className="snowfall">{props.children}</div>
    </div>
  );
}

export default Snowfall;
