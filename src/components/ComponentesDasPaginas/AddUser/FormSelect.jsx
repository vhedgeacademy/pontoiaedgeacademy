import React from 'react';

const FormSelect = ({ label, value, onChange, options, placeholder }) => {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm text-gray-600">{label}</label>
      <select
        value={value}
        onChange={onChange}
        className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 bg-white appearance-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23333' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 1rem center'
        }}
      >
        <option value="">{placeholder}</option>
        {options.map((option, index) => (
          <option key={index} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default FormSelect;