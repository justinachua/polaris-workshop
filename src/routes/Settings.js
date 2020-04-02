import React, {useEffect, useState} from 'react';
import {graphql, compose} from 'react-apollo';
import gql from 'graphql-tag';
import {
  Card,
  Page,
  Layout,
  Form,
  ChoiceList,
  Checkbox,
  TextField,
  FormLayout,
  SkeletonBodyText,
  SkeletonDisplayText,
  TextContainer,
} from '@shopify/polaris';

function Settings({loading, updateSettingsMutation}) {
  const [autoPublish, setAutoPublish] = useState(false);
  const [email, setEmail] = useState('');
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [emailError, setEmailError] = useState(false);

  /*
  useEffect((settingsQuery) => {
    if (loading) {
      return null;
    }
    console.log(settingsQuery);
    setAutoPublish(settingsQuery.autoPublish);
    setEmail(settingsQuery.email);
    setEmailNotifications(settingsQuery.emailNotifications);

    return {autoPublish, email, emailNotifications};
  }, []);
  */

  const handleAutoPublishChange = (value) => {
    setAutoPublish(value[0] === 'enabled');
  };

  const handleEmailNotificationChange = (receiveNotifications) => {
    // If the merchant elects to receive email notifications by checking the checkbox, but hasn't input an email address in the text field, we let them know they need to add their email by rendering an error message
    setEmailError(receiveNotifications && email === ''
      ? 'Enter an email to get review notifications.'
      : undefined);
    setEmailNotifications(receiveNotifications);
  };

  const handleEmailChange = (value) => {
    setEmailError(emailNotifications && value === ''
    ? 'Enter an email to get review notifications.'
    : false);
    setEmail(value);
  };

  const handleFormSubmit = () => {
    // We prevent form submission when there is an error in the email field.
    if (emailError) {
      return;
    }

    // Otherwise, we use GraphQL to update the merchant's app settings.
    updateSettingsMutation({
      variables: {
        autoPublish,
        emailNotifications,
        email,
      },
    });
  };

  // While the data loads during our GraphQL request, we render skeleton content to signify to the merchant that page data is on its way.
  const loadingStateContent = loading ? (
    <Layout>
      <Layout.AnnotatedSection
        title="Auto publish"
        description="Automatically check new reviews for spam and then publish them."
      >
        <Card sectioned>
          <TextContainer>
            <SkeletonDisplayText size="small" />
            <SkeletonBodyText />
          </TextContainer>
        </Card>
      </Layout.AnnotatedSection>
      <Layout.AnnotatedSection
        title="Email settings"
        description="Choose if you want to receive email notifications for each review."
      >
        <Card sectioned>
          <TextContainer>
            <SkeletonDisplayText size="small" />
            <SkeletonBodyText />
          </TextContainer>
        </Card>
      </Layout.AnnotatedSection>
    </Layout>
  ) : null;

  const autoPublishSelected = autoPublish ? ['enabled'] : ['disabled'];

  const settingsFormContent = !loading ? (
    <Layout>
      {/* Annotated sections are useful in settings pages to give more context about what the merchant will change with each setting. */}
      <Layout.AnnotatedSection
        title="Auto publish"
        description="Automatically check new reviews for spam and then publish them."
      >
        <Card sectioned>
          {/* Choice lists display a list of checkboxes or radio buttons to gather choice input. See the style guide to learn more https://polaris.shopify.com/components/forms/choice-list */}
          <ChoiceList
            title="Auto publish"
            choices={[
              {
                label: 'Enabled',
                value: 'enabled',
                helpText:
                  'New reviews are checked for spam and then automatically published.',
              },
              {
                label: 'Disabled',
                value: 'disabled',
                helpText:
                  'You must manually approve and publish new reviews.',
              },
            ]}
            selected={autoPublishSelected}
            onChange={handleAutoPublishChange}
          />
        </Card>
      </Layout.AnnotatedSection>
      <Layout.AnnotatedSection
        title="Email settings"
        description="Choose if you want to receive email notifications for each review."
      >
        <Card sectioned>
          <FormLayout>
            <TextField
              value={email}
              label="Email"
              type="email"
              error={emailError}
              onChange={handleEmailChange}
            />
            <Checkbox
              checked={emailNotifications}
              label="Send me an email when a review is submitted."
              onChange={handleEmailNotificationChange}
            />
          </FormLayout>
        </Card>
      </Layout.AnnotatedSection>
    </Layout>
  ) : null;

  // We wrap our page component in a form component that handles form submission for the whole page. We could also handle submittal with the onClick event of the save button. Either approach works fine.
  return (
    <Form onSubmit={handleFormSubmit}>
      <Page
        title="Settings"
        breadcrumbs={[{content: 'Product reviews', url: '/'}]}
        primaryAction={{
          content: 'Save',
          submit: true,
          disabled: emailError,
        }}
      >
        {loadingStateContent}
        {settingsFormContent}
      </Page>
    </Form>
  );
}

export default compose(
  graphql(
    gql`
      query SettingsQuery {
        settings {
          autoPublish
          emailNotifications
          email
        }
      }
    `,
    {
      name: 'settingsQuery',
    },
  ),
  graphql(
    gql`
      mutation updateSettings(
        $autoPublish: Boolean
        $emailNotifications: Boolean
        $email: String
      ) {
        updateSettings(
          autoPublish: $autoPublish
          emailNotifications: $emailNotifications
          email: $email
        ) {
          autoPublish
          emailNotifications
          email
        }
      }
    `,
    {
      name: 'updateSettingsMutation',
    },
  ),
)(Settings);
