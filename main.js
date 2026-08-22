const rootEl = document.getElementById('root');

try {
  const [{ default: React }, { createRoot }, { default: LedgerApp }] = await Promise.all([
    import('react'),
    import('react-dom/client'),
    import('./ledger-app.js'),
  ]);
  createRoot(rootEl).render(React.createElement(LedgerApp));
} catch (err) {
  console.error('Ledger failed to start:', err);
  rootEl.innerHTML =
    '<div style="font-family: sans-serif; color: #e2e8f0; background:#020617; min-height:100vh; ' +
    'display:flex; align-items:center; justify-content:center; padding:2rem; text-align:center;">' +
    '<div><h1 style="font-size:1.25rem;">Something didn\'t load correctly</h1>' +
    '<p style="color:#94a3b8; margin-top:0.5rem;">Please refresh the page. If this persists, open the browser console for details.</p>' +
    '</div></div>';
}
