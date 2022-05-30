import React, { useState } from 'react';

const ToggleButton = ({
  id = '',
  checked,
  onChange,
  labels,
}) => {
  const [value, setVal] = useState(!!checked);
  const update = () => {
    setVal(!value);
    onChange(!value);
  };

  return (
    <div className="form-check form-switch">
      <input className="form-check-input" type="checkbox" id={`toggle-switch-${id}`} onChange={update} checked={value} />
      <label className="form-check-label" htmlFor={`toggle-switch-${id}`}>{value ? labels.on : labels.off}</label>
    </div>
  );
};

export default ToggleButton;
