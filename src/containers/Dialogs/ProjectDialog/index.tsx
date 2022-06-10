import React from 'react';
import styled from 'styled-components';
import { Dialog, DialogSuspense, FormattedMessage as T } from 'components';
import withDialogRedux from 'components/DialogReduxConnect';
import { compose } from 'utils';

const ProjectDialogContent = React.lazy(
  () => import('./containers/ProjectDialogContent'),
);

/**
 * Project dialog.
 * @returns
 */
function ProjectDialog({ dialogName, payload: { projectId = null }, isOpen }) {
  return (
    <Dialog
      name={dialogName}
      title={'New Project'}
      isOpen={isOpen}
      autoFocus={true}
      canEscapeKeyClose={true}
      className={'dialog--project-form'}
      style={{ width: '400px' }}
    >
      <DialogSuspense>
        <ProjectDialogContent dialogName={dialogName} project={projectId} />
      </DialogSuspense>
    </Dialog>
  );
}

export default compose(withDialogRedux())(ProjectDialog);

// const ProjectDialogRoot = styled(Dialog)`
//   .bp3-dialog-body {
//     .bp3-form-group {
//       margin-bottom: 15px;
//       margin-top: 15px;

//       label.bp3-label {
//         margin-bottom: 3px;
//         font-size: 13px;
//       }
//     }

//     .bp3-dialog-footer {
//       padding-top: 10px;
//     }
//   }
// `;
