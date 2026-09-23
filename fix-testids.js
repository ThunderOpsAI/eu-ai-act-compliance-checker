const fs = require('fs');
const path = require('path');

function replace(file, search, replaceStr) {
  const filePath = path.join(__dirname, 'src', file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    content = content.replace(search, replaceStr);
    fs.writeFileSync(filePath, content);
  }
}

// src/components/compliance-form.tsx
replace('components/compliance-form.tsx', 
  '<form onSubmit={handleSubmit}', 
  '<form data-testid="form-container" onSubmit={handleSubmit}');
replace('components/compliance-form.tsx', 
  'onClick={() => handlePresetSelect(preset)}', 
  'data-testid="preset-button" onClick={() => handlePresetSelect(preset)}');
replace('components/compliance-form.tsx', 
  '<span className="text-xs font-mono', 
  '<span data-testid="char-counter" className="text-xs font-mono');

// src/components/result-view.tsx
replace('components/result-view.tsx', 
  'className="max-w-4xl mx-auto', 
  'data-testid="result-view-container" className="max-w-4xl mx-auto');
replace('components/result-view.tsx', 
  '<RiskBadge riskTier', 
  '<div data-testid="risk-badge"><RiskBadge riskTier');
replace('components/result-view.tsx', 
  '</RiskBadge>', 
  '</RiskBadge></div>');
replace('components/result-view.tsx', 
  '<span className="text-sm font-medium text-slate-900', 
  '<span data-testid="matched-article" className="text-sm font-medium text-slate-900');
replace('components/result-view.tsx', 
  'key={index} className="flex gap-3', 
  'data-testid="obligation-item" key={index} className="flex gap-3');
replace('components/result-view.tsx', 
  '<span className={`px-2 py-0.5', 
  '<span data-testid="mandatory-badge" className={`px-2 py-0.5');
replace('components/result-view.tsx', 
  'className="relative rounded-2xl border', 
  'data-testid="blurred-teaser" className="relative rounded-2xl border');
replace('components/result-view.tsx', 
  '<CheckoutElement', 
  '<div data-testid="checkout-element"><CheckoutElement');
replace('components/result-view.tsx', 
  'returnToTeaser', 
  'returnToTeaser/></div>');
replace('components/result-view.tsx', 
  'onClick={() => setShowCheckout(true)}', 
  'data-testid="checkout-cta" onClick={() => setShowCheckout(true)}');

// src/components/progress-stepper.tsx
replace('components/progress-stepper.tsx', 
  '<div className="w-full max-w-md mx-auto', 
  '<div data-testid="progress-stepper" className="w-full max-w-md mx-auto');

// src/components/error-boundary.tsx
replace('components/error-boundary.tsx', 
  '<div className="rounded-xl border border-red-500/20 bg-red-500/10 p-6 flex flex-col items-center justify-center text-center space-y-4 shadow-lg"', 
  '<div data-testid="error-boundary" className="rounded-xl border border-red-500/20 bg-red-500/10 p-6 flex flex-col items-center justify-center text-center space-y-4 shadow-lg"');
replace('components/error-boundary.tsx', 
  'onClick={resetErrorBoundary}', 
  'data-testid="retry-button" onClick={resetErrorBoundary}');

// src/components/checkout-element.tsx
replace('components/checkout-element.tsx', 
  '<input\n          type="email"', 
  '<input data-testid="checkout-email-input"\n          type="email"');
replace('components/checkout-element.tsx', 
  'type="submit"', 
  'data-testid="checkout-submit-button" type="submit"');
replace('components/checkout-element.tsx', 
  'onClick={onCancel}', 
  'data-testid="checkout-cancel-button" onClick={onCancel}');
replace('components/checkout-element.tsx', 
  'className="text-sm text-red-500 bg-red-50 p-3 rounded-lg flex items-start gap-2"', 
  'data-testid="checkout-error" className="text-sm text-red-500 bg-red-50 p-3 rounded-lg flex items-start gap-2"');
replace('components/checkout-element.tsx', 
  '<div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-8 text-center space-y-4"', 
  '<div data-testid="payment-success-message" className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-8 text-center space-y-4"');
replace('components/checkout-element.tsx', 
  'href={`/api/reports/${reportId}/download`}', 
  'data-testid="download-pdf-link" href={`/api/reports/${reportId}/download`}');

// src/components/account-upgrade.tsx
replace('components/account-upgrade.tsx', 
  '<div className="mt-8 rounded-2xl border', 
  '<div data-testid="account-upgrade-container" className="mt-8 rounded-2xl border');
replace('components/account-upgrade.tsx', 
  '<input\n              type="email"', 
  '<input data-testid="upgrade-email-input"\n              type="email"');
replace('components/account-upgrade.tsx', 
  '<button\n              type="submit"', 
  '<button data-testid="upgrade-submit-button"\n              type="submit"');
replace('components/account-upgrade.tsx', 
  'className="text-sm text-red-500 bg-red-50 p-3 rounded-lg flex items-start gap-2"', 
  'data-testid="upgrade-error-message" className="text-sm text-red-500 bg-red-50 p-3 rounded-lg flex items-start gap-2"');
replace('components/account-upgrade.tsx', 
  'className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-6 text-center space-y-3"', 
  'data-testid="upgrade-success-message" className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-6 text-center space-y-3"');
