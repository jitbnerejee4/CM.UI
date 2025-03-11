// Here we are parsing these: "<a target=\"_blank\" href=\"http://localhost/Code.UI/ComCon/Tab/RenderTab?tabName=casedetails&id=234\">HOME0000234</a>",

function parseHTML(htmlString) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, 'text/html');
    const anchor = doc.querySelector('a');
    if (anchor) {
      return { href: anchor.getAttribute('href'), text: anchor.textContent };
    }
    return { href: '', text: '' };
  }

  export default parseHTML