import React from "react";

export default function Closing({ type }) {
  return (
    <div className="closing-box">
      <div className="heading">
        <h1>Discard {type}</h1>
        <p>Do you not want to be part of WatchHub</p>
      </div>
      <div className="selection">
        <button>Discard</button>
        <button>Cancel</button>
      </div>
    </div>
  );
}
