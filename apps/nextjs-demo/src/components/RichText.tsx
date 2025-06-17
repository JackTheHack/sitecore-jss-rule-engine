import { Text, Field, RichText, withDatasourceCheck, RichTextField } from '@sitecore-jss/sitecore-jss-nextjs';
import { ComponentProps } from 'lib/component-props';

type TestProps = ComponentProps & {
  fields: {
    Text: RichTextField;
  };
};

const RichTextComponent = (props: TestProps): JSX.Element => {
  return (
  <div>
    <RichText field={props.fields.Text} />
  </div>);
};

export default withDatasourceCheck()<TestProps>(RichTextComponent);
