export function jsx(type, props, ...children) {
  return { type, props, children };
}

function createElement(node) {
  if (!node) return null;

  const { type, props, children } = node;

  const element = document.createElement(type);

  if (props) {
    for (const [key, value] of Object.entries(props)) {
      const attribute = document.createAttribute(key);
      attribute.value = value;
      element.setAttributeNode(attribute);
    }
  }

  if (Array.isArray(children)) {
    for (const child of children) {
      if (typeof child === "string") {
        element.textContent = child;
      } else if (typeof child === "object") {
        const childElement = createElement(child);
        element.appendChild(childElement);
      }
    }
  }

  return element;
}

function updateAttributes(target, newProps = [], oldProps = []) {
  for (const { name } of [...newProps]) {
    const newValue = newProps[name]?.value;
    const oldValue = oldProps[name]?.value;

    if (newValue === oldValue) continue;

    target.setAttribute(name, newValue);
  }

  for (const { name } of [...oldProps]) {
    const newValue = newProps[name]?.value;

    if (newValue) continue;

    target.removeAttribute(name);
  }
}

export function render(parent, newNode, oldNode, index = 0) {
  newNode = newNode instanceof Element ? newNode : createElement(newNode);
  oldNode = oldNode instanceof Element ? oldNode : createElement(oldNode);

  if (index === 0 && oldNode) {
    oldNode = parent.firstChild;
  }
  index += 1;

  // 1. 만약 newNode가 없고 oldNode만 있다면
  //   parent에서 oldNode를 제거
  //   종료
  if (!newNode && oldNode) {
    parent.removeChild(oldNode);

    return;
  }
  // 2. 만약 newNode가 있고 oldNode가 없다면
  //   newNode를 생성하여 parent에 추가
  //   종료
  if (newNode && !oldNode) {
    parent.appendChild(newNode);

    return;
  }

  // 3. 만약 newNode와 oldNode 둘 다 문자열이고 서로 다르다면
  //   oldNode를 newNode로 교체
  //   종료

  if (
    newNode.nodeType === Node.TEXT_NODE &&
    oldNode.nodeType === Node.TEXT_NODE &&
    newNode.textContent !== oldNode.textContent
  ) {
    oldNode.textContent = newNode.textContent;
    return;
  }

  // 4. 만약 newNode와 oldNode의 타입이 다르다면
  //   oldNode를 newNode로 교체
  //   종료

  if (newNode.nodeType !== oldNode.nodeType) {
    oldNode = newNode;
    return;
  }

  // 5. newNode와 oldNode에 대해 updateAttributes 실행
  updateAttributes(oldNode, newNode?.attributes, oldNode?.attributes);

  // 6. newNode와 oldNode 자식노드들 중 더 긴 길이를 가진 것을 기준으로 반복
  //   각 자식노드에 대해 재귀적으로 render 함수 호출
  const newChildren = newNode.childNodes;
  const oldChildren = oldNode.childNodes;

  const childCount = Math.max(newChildren.length, oldChildren.length);

  for (let i = 0; i < childCount; i++) {
    const newChild = newChildren[i];
    const oldChild = oldChildren[i];

    render(oldNode, newChild, oldChild, index);
  }
}
