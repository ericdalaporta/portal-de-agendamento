// Inicializa mermaid para todos os diagramas renderizados pelo MkDocs
(function () {
  if (!window.mermaid) {
    return;
  }

  window.mermaid.initialize({
    startOnLoad: true,
    theme: 'default'
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', window.mermaid.run);
  } else {
    window.mermaid.run();
  }
})();
