import { createHooks } from "./hooks";
import { render as updateElement } from "./render";

function MyReact() {
  const _render = () => {
    resetHookContext();

    //TODO 여기서 렌더링 로직이 필요한데 어떻게 접근하지?
  };

  function render($root, rootComponent) {
    const newNode = rootComponent();
    const oldNode = $root.firstChild;

    updateElement($root, newNode, oldNode);
  }

  const { useState, useMemo, resetContext: resetHookContext } = createHooks(_render);

  return { render, useState, useMemo };
}

export default MyReact();
