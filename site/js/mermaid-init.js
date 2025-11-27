// Inicializa mermaid para todos os diagramas renderizados pelo MkDocs
window.mermaid = window.mermaid || undefined;
if (window.mermaid) {
  window.mermaid.initialize({ startOnLoad: true, theme: 'default' });
}
