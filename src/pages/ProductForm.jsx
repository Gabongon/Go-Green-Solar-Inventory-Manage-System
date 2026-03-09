import React from 'react';

const ProductForm = ({ initialData, onClose }) => {
  return (
    <div className="p-4">
      <h3 className="text-lg font-medium mb-4">
        {initialData ? 'Edit Material' : 'Add New Material'}
      </h3>
      <p className="text-sm text-gray-500 mb-4">Form implementation is currently being updated.</p>
      <div className="flex justify-end">
        <button onClick={onClose} className="btn-secondary">Close</button>
      </div>
    </div>
  );
};

export default ProductForm;