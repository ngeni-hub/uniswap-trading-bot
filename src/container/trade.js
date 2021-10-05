import { Card, CardContent, CardHeader, IconButton, LinearProgress } from '@material-ui/core';
import AddCircleRoundedIcon from '@material-ui/icons/AddCircleRounded';
import RemoveCircleRoundedIcon from '@material-ui/icons/RemoveCircleRounded';
import { FieldArray, Form, Formik } from 'formik';
import { TextField } from 'formik-material-ui';
import React, { useEffect, useState } from 'react';
import { botDatabase } from '../trading/database';
import { CenterContent, StyledButton, StyledField } from './style';

function Trade() {

  const [trades, settrades] = useState(null);

  useEffect(() => {
    const getConfig = async () => {
      try {
        const trades = botDatabase.get('trades')
          .value();
        console.log(trades);
        settrades(trades);
      } catch (e) {
        console.log(e);
      }
    }
    getConfig();
  }, []);

  if (!trades) return null;

  return (
    <Formik
      validate={values => {
        const errors = {};
        return errors;
      }}
      initialValues={{ trades: trades }}
      onSubmit={(values, { setSubmitting }) => {

        const { trades } = values;
        console.log(trades);
        botDatabase.set('trades', trades)
          .write();

        setTimeout(() => {
          setSubmitting(false);
        }, 1000);
      }}
    >
      {({ submitForm, isSubmitting, values }) => (
        <Form>
          <FieldArray
            name="trades"
            render={arrayHelpers => (
              <div>
                {values.trades.map((trade, index) => (
                  <Card elevation={0}>
                    <CardHeader
                      action={
                        <IconButton color="secondary" onClick={() => arrayHelpers.remove(index)}>
                          <RemoveCircleRoundedIcon />
                        </IconButton>
                      }
                    />
                    <CardContent>
                      <StyledField
                        fullWidth
                        component={TextField}
                        name={`trades[${index}].tokenSymbol`}
                        label="Token Name"
                      />
                      <StyledField
                        fullWidth
                        component={TextField}
                        name={`trades[${index}].tokenAddress`}
                        label="Token Address"
                      />
                      <StyledField
                        fullWidth
                        component={TextField}
                        type="number"
                        name={`trades[${index}].buyLimit`}
                        label="Buy Limit"
                      />
                      <StyledField
                        fullWidth
                        component={TextField}
                        type="number"
                        name={`trades[${index}].toBuy`}
                        label="Number of token to Buy"
                      />
                      <StyledField
                        fullWidth
                        component={TextField}
                        type="number"
                        name={`trades[${index}].sellLimit`}
                        label="Sell Limit"
                      />
                      <StyledField
                        fullWidth
                        component={TextField}
                        type="number"
                        name={`trades[${index}].toSell`}
                        label="Number of token to Sell"
                      />
                    </CardContent>
                  </Card>
                ))}
                <CenterContent>
                  <IconButton color="primary" onClick={() => arrayHelpers.push({})}>
                    <AddCircleRoundedIcon />
                  </IconButton>
                </CenterContent>
              </div>
            )}
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
      )
      }
    </Formik>
  )
}

export default Trade;