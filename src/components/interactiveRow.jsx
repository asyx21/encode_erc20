import React from 'react';

const IRow = function irow(props) {
  const { item, data, action } = props;

  let dataContent = null;
  if (data) {
    const { results, error } = data;

    let err = 'ERROR';
    try {
      err = Object.values(error)[0].status;
      if (typeof err !== 'boolean') err = decodeURIComponent(Object.values(error)[0]);
    } catch (e) {
      err = 'ERROR';
    }
    if (error) {
      dataContent = (
        <div className="row mt-2 text-danger">
          {String(err)}
        </div>
      );
    } else {
      dataContent = (
        <div className="row mt-2">
          {results && results.length && item.outputs ? item.outputs.map((field, id) => {
            const key = `res_${item.name}_${field.name}`;
            return (
              <div className="input-group mb-3" key={key}>
                {field.name ? <span className="input-group-text" id={key}>{field.name}</span> : null}
                <input
                  id={key}
                  type="text"
                  className="form-control"
                  value={results[id].status ? String(results[id].status) : String(results[id])}
                  disabled
                />
              </div>
            );
          }) : <span>Nothing to display</span>}
        </div>
      );
    }
  }

  return (
    <div className="container">
      <form
        onSubmit={(evt) => {
          evt.preventDefault();
          evt.stopPropagation();
          const fields = {};
          Object.values(evt.target.elements).forEach((el) => {
            if (el.name) fields[el.name] = encodeURIComponent(el.value);
          });

          action(item, fields);
        }}
      >
        <div className="row">
          {data && data.waiting ? (
            <div className="col col-md-3">
              <span className="spinner-border txt-main" role="status">
                <span className="sr-only" />
              </span>
            </div>
          ) : (
            <div className="col col-md-3">
              <button
                type="submit"
                className="btn btn-secondary"
                // onClick={item.inputs ? () => action(item) : null}
                disabled={!item.inputs}
              >
                {`${item.name}()`}
              </button>
            </div>
          )}
          <div className="col col-md-3">
            <span className="badge rounded-pill bg-secondary" style={{ marginRight: '3px' }}>
              {item.stateMutability}
            </span>
            {item.paylable ? (
              <span className="badge rounded-pill bg-warning" style={{ marginRight: '3px' }}>payable</span>
            ) : null}
            {item.constant ? (
              <span className="badge rounded-pill bg-info" style={{ marginRight: '3px' }}>constant</span>
            ) : null}
          </div>
        </div>
        <div className="row">
          {item.inputs.map((input) => {
            const key = `input_${item.name}_${input.name}`;
            return (
              <div className="col-6 mt-2" key={input.name}>
                <div className="input-group mb-3">
                  {input.name ? <span className="input-group-text" id={key}>{input.name}</span> : null}
                  <input type="text" className="form-control" id={key} name={input.name} />
                </div>
              </div>
            );
          })}
        </div>
      </form>
      {dataContent}
    </div>
  );
};

export default IRow;
