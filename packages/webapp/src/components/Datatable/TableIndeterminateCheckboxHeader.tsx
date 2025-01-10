// @ts-nocheck
import React,{useEffect} from 'react';
import { Checkbox } from '@blueprintjs/core';

export default function TableIndeterminateCheckboxHeader({getToggleAllRowsSelectedProps,handleBulkCheckboxClick,data}) {
  const handleBulkClick = (eventTarget,data) => {
    handleBulkCheckboxClick(eventTarget,data);
  };
      
  return (
    <div>
      <Checkbox {...getToggleAllRowsSelectedProps()} onClick={(e)=>{
        handleBulkClick(e.target,data)
      }} />
    </div>
  );
}

