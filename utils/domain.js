export function filterDomain(domain, tld) {
  if (!domain) return '';
  let d = domain.replace(/https|http/g, '');
  d = d.replace(/[\/:]/g, '');
  d = d.replace('www.', '');

  const dotIndex = d.indexOf('.');
  const name = dotIndex > -1 ? d.substring(0, dotIndex) : d;

  if (!name) {
    return d + '.' + tld;
  }

  return name + '.' + tld;
}
