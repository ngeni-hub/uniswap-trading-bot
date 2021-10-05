import { LinearProgress } from '@material-ui/core';
import { Form, Formik } from 'formik';
import { TextField } from 'formik-material-ui';
import { default as React, useEffect, useState } from 'react';
import { botDatabase } from '../trading/database';
import { StyledButton, StyledField } from './style';

function Settings() {

  const [settings, setSettings] = useState(null);

  useEffect(() => {

    const getConfig = async () => {
      try {
        const config = botDatabase.get('config')
          .value();
        setSettings(config);
      } catch (e) {
        console.log(e);
      }

    }
    getConfig();
  }, []);

  if (!settings) return null;

  return (
    <Formik
      validate={values => {
        const errors = {};
        if (!values.infuraId) {
          errors.infuraId = "Insert Infura ID"
        }
        if (!values.privatekey) {
          errors.privatekey = "Insert Private Key"
        }
        return errors;
      }}
      onSubmit={(values, { setSubmitting }) => {
        botDatabase.set('config', values)
          .write();

        setTimeout(() => {
          setSubmitting(false);
          window.location.reload();
        }, 3000);
      }}
      initialValues={settings}
    >
      {({ submitForm, isSubmitting }) => (
        <Form>
          <StyledField
            fullWidth
            component={TextField}
            name="infuraId"
            label="Infura ID"
          />
          <StyledField
            fullWidth
            component={TextField}
            name="privatekey"
            label="Private Key"
          />
          <StyledField
            fullWidth
            component={TextField}
            name="telegramBotApi"
            label="Telegram Bot API"
          />
          {isSubmitting && <LinearProgress />}
          <br />
          <StyledButton
            fullWidth
            variant="contained"
            color="primary"
            disabled={isSubmitting}
            onClick={submitForm}
          >
            Save Settings
          </StyledButton>
        </Form>
      )}
    </Formik>
  )
}

export default Settings;