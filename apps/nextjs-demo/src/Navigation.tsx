import config from 'temp/config';

// Prefix public assets with a public URL to enable compatibility with Sitecore editors.
// If you're not supporting Sitecore editors, you can remove this.
const publicUrl = config.publicUrl;

const Navigation = (): JSX.Element => (
  <div>
    <nav>
          <a href="https://sitecore.com">
            <img src={`${publicUrl}/sc_logo.svg`} alt="Sitecore" />
          </a>      
    </nav>
  </div>
);

export default Navigation;
