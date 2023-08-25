import { GetServerSidePropsContext, GetStaticPropsContext } from 'next';
import { Plugin } from '..';
import { SitecorePageProps } from 'lib/page-props';
import { personalizationHelper } from 'lib/personalizationHelper';

class RulesPersonalizationPlugin implements Plugin {
  order = 3;

  isDisconnectedMode(props:SitecorePageProps) {
    const disconnectedMode = props.layoutData.sitecore.context.site?.name === 'JssDisconnectedLayoutService';
    return disconnectedMode;
}

  isPageEditing(props:SitecorePageProps) {
      const isEditing = props.layoutData.sitecore.context.pageEditing;
      return isEditing;
  }

  async exec(props: SitecorePageProps, context: GetServerSidePropsContext | GetStaticPropsContext) {
    var doRun =
            !context.preview &&
            !this.isDisconnectedMode(props) &&
            !this.isPageEditing(props);

    if (!doRun) {
      return props;
    }   

    if(props.layoutData.sitecore.route &&
       props.layoutData.sitecore.route.fields)
    {

      var routeFields = props.layoutData.sitecore.route.fields;
      var personalizationRule = routeFields["PersonalizationRules"];
      var personalizeOnEdge = routeFields["PersonalizeOnEdge"];

      if(personalizeOnEdge && personalizeOnEdge.value)
      {
        await personalizationHelper.personalize(props, personalizationRule);      
      }
    }

    return props;
  }
}

export const rulesPersonalizationPlugin = new RulesPersonalizationPlugin();
