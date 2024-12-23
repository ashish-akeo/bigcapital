// @ts-nocheck
import React, { Component } from 'react';
const JournalDeleteAlert = React.lazy(
  () => import('@/containers/Alerts/ManualJournals/JournalDeleteAlert'),
);
const JournalPublishAlert = React.lazy(
  () => import('@/containers/Alerts/ManualJournals/JournalPublishAlert'),
);
const JournalBulkPublishAlert = React.lazy(
  ()=>import('@/containers/Alerts/ManualJournals/JournalBulkPublishAlert')
)
const JournalBulkDeleteAlert = React.lazy(
  ()=>import('@/containers/Alerts/ManualJournals/JournalBulkDeleteAlert')
)

/**
 * Manual journals alerts.
 */

export default [
  { name: 'journal-delete', component: JournalDeleteAlert },
  { name: 'journal-publish', component: JournalPublishAlert },
  {name:'bulk-publish-alert',component:JournalBulkPublishAlert},
  {name:'bulk-delete-alert',component:JournalBulkDeleteAlert}
];
