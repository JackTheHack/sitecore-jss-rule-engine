import { Text, Field, withDatasourceCheck } from '@sitecore-jss/sitecore-jss-nextjs';
import { ComponentProps } from 'lib/component-props';

type TestProps = ComponentProps & {
  fields: {
    Text: Field<string>;
  };
};

const RichText = (props: TestProps): JSX.Element => {
  //console.log('rte props', props);
  return (<div>
    <p>Test Component</p>
    
    <Text field={props.fields.Text} />
  </div>);
};

export default withDatasourceCheck()<TestProps>(RichText);
