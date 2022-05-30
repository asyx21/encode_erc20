import React, { useState } from 'react';
import { Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { object, string, number } from 'yup';
import Web3 from 'web3';

function ExpandInputAction({
  danger,
  decimals,
  symbol,
  method,
  data,
  useMethod,
  account,
  label,
  validate,
  tips = '',
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="m-4">
      <OverlayTrigger
        placement="bottom"
        overlay={(
          <Tooltip id="tooltip-bottom">{tips}</Tooltip>
        )}
      >
        <Button
          className="look-second fw-bold"
          variant="main"
          onClick={() => setExpanded(!expanded)}
          style={{ width: '98%' }}
        >
          {label || 'toggle'}
        </Button>
      </OverlayTrigger>
      {expanded ? (
        <div className="m-2">
          <div className="card card-body">
            <Formik
              initialValues={method.inputs.reduce((acc, input) => ({ ...acc, [input.name]: '' }), {})}
              validationSchema={object().shape({
                ...method.inputs.reduce((acc, input) => {
                  if (method.name === 'allowance' && input.name === 'owner') return acc;
                  if (method.name === 'transferFrom' && input.name === 'recipient') return acc;
                  if (['spender', 'sender', 'recipient'].includes(input.name)) {
                    return { ...acc, [input.name]: string().matches(/^0x[0-9a-fA-F]{40}$/, 'Must be ethereum address').required() };
                  }
                  return { ...acc, [input.name]: number('Must input a number').positive().max(1e11, 'Max 100 Billions').required() };
                }, {}),
              })}
              onSubmit={(values, { setSubmitting }) => {
                const amount = values.amount ? { amount: Web3.utils.toWei(values.amount) } : {};
                if (method.name === 'allowance') useMethod(method, { ...values, ...amount, owner: account });
                else if (method.name === 'transferFrom') useMethod(method, { ...values, ...amount, recipient: account });
                else useMethod(method, { ...values, ...amount });
                // setExpanded(false);
                setSubmitting(false);
              }}
            >
              {({ isSubmitting, errors }) => (
                <Form className="needs-validation">
                  <div className="row">
                    {method.inputs.map((input) => {
                      const key = `wui_easy_input_${input.name}`;
                      if (method.name === 'allowance' && input.name === 'owner') return null;
                      if (method.name === 'transferFrom' && input.name === 'recipient') return null;
                      return (
                        <div className="col-6" key={input.name}>
                          <div className="input-group mb-3 has-validation">
                            {input.name ? <span className="input-group-text" id={key}>{input.name}</span> : null}
                            <Field
                              type="text"
                              className={`form-control ${errors[input.name] ? 'is-invalid' : ''}`}
                              aria-describedby={key}
                              name={input.name}
                              required
                            />
                            <ErrorMessage
                              name={input.name}
                              render={(msg) => (
                                <div className="invalid-feedback">{msg}</div>
                              )}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="row mt-2">
                    {data && data.results && data.results.length && method.outputs ? method.outputs.map((field, id) => {
                      const key = `eia-res_${method.name}_${field.name}`;
                      const res = data.results[id];

                      if (typeof res !== 'string') {
                        return (
                          <div key={key} className="col-12 mb-3">{res.status ? '🤗' : '🙁'}</div>
                        );
                      }
                      return (
                        <div key={key} className="col-12 mb-3">
                          {['allowance'].includes(method.name) ? `${res * 10 ** (-decimals)} ${symbol}` : res}
                        </div>
                      );
                    }) : null}
                  </div>
                  {data && data.waiting ? (
                    <div>
                      <span className="spinner-border txt-main" role="status">
                        <span className="sr-only" />
                      </span>
                    </div>
                  ) : (
                    <Button
                      variant={danger ? 'danger' : 'secondary'}
                      type="submit"
                      style={{ maxWidth: '250px', margin: 'auto' }}
                      disabled={isSubmitting}
                    >
                      {validate || 'validate'}
                    </Button>
                  )}
                </Form>
              )}
            </Formik>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default ExpandInputAction;
