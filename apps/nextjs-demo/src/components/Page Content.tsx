import { Text, RichText, Field, withDatasourceCheck, useSitecoreContext, TextField, RichTextField } from '@sitecore-jss/sitecore-jss-nextjs';
import { ComponentProps } from 'lib/component-props';

type ContentBlockProps = ComponentProps & {
  fields?: {
    title: Field<string>;
    content: Field<string>;
  };
};
/**
 * A simple Content Block component, with a heading and rich text block.
 * This is the most basic building block of a content site, and the most basic
 * JSS component that's useful.
 */
const ContentBlock = ({ fields }: ContentBlockProps): JSX.Element => {
  const { sitecoreContext } = useSitecoreContext();
  const pageFields = sitecoreContext.route?.fields || {};

  // Use provided fields or fall back to page fields
  const title = pageFields.Title as TextField;
  const content = pageFields.Content as RichTextField;

  return (
    <div className="contentBlock">
    <h2 className="contentTitle">{title?.value}</h2>
    <div className="contentDescription" dangerouslySetInnerHTML={{ __html: content?.value ?? '' }} />
    </div>
  );
};

export default ContentBlock;
