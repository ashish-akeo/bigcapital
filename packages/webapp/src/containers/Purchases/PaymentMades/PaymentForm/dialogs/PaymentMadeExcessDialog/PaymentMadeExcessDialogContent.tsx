// @ts-nocheck
import * as R from 'ramda';
import * as Yup from 'yup';
import { useMemo } from 'react';
import { Button, Classes, Intent } from '@blueprintjs/core';
import { Form, Formik, FormikHelpers, useFormikContext } from 'formik';
import { AccountsSelect, FFormGroup } from '@/components';
import { usePaymentMadeFormContext } from '../../PaymentMadeFormProvider';
import withDialogActions from '@/containers/Dialog/withDialogActions';

interface ExcessPaymentValues {
  accountId: string;
}

const initialValues = {
  accountId: '',
} as ExcessPaymentValues;

const Schema = Yup.object().shape({
  accountId: Yup.number().required(),
});

const DEFAULT_ACCOUNT_SLUG = 'depreciation-expense';

function ExcessPaymentDialogContentRoot({ dialogName, closeDialog }) {
  const {
    setFieldValue,
    submitForm,
  } = useFormikContext();
  const { setIsExcessConfirmed } = usePaymentMadeFormContext();

  const handleSubmit = (
    values: ExcessPaymentValues,
    { setSubmitting }: FormikHelpers<ExcessPaymentValues>,
  ) => {
    setFieldValue(values.accountId);
    setSubmitting(true);
    setIsExcessConfirmed(true);

    return submitForm().then(() => {
      setSubmitting(false);
      closeDialog(dialogName);
    });
  };

  // Handle close button click.
  const handleCloseBtn = () => {
    closeDialog(dialogName);
  };
  const defaultAccountId = useDefaultExcessPaymentDeposit();

  return (
    <Formik
      initialValues={{
        ...initialValues,
        accountId: defaultAccountId,
      }}
      validationSchema={Schema}
      onSubmit={handleSubmit}
    >
      <Form>
        <ExcessPaymentDialogContentForm onClose={handleCloseBtn} />
      </Form>
    </Formik>
  );
}

export const ExcessPaymentDialogContent = R.compose(withDialogActions)(
  ExcessPaymentDialogContentRoot,
);

interface ExcessPaymentDialogContentFormProps {
  onClose?: () => void;
}

function ExcessPaymentDialogContentForm({
  onClose,
}: ExcessPaymentDialogContentFormProps) {
  const { submitForm, isSubmitting } = useFormikContext();
  const { accounts } = usePaymentMadeFormContext();

  const handleCloseBtn = () => {
    onClose && onClose();
  };
  return (
    <>
      <div className={Classes.DIALOG_BODY}>
        <p>
          Would you like to record the excess amount of $1000 as advanced
          payment from the customer.
        </p>

        <FFormGroup
          name={'accountId'}
          label={'The excessed amount will be deposited in the'}
        >
          <AccountsSelect
            name={'accountId'}
            items={accounts}
            buttonProps={{ small: true }}
          />
        </FFormGroup>
      </div>

      <div className={Classes.DIALOG_FOOTER}>
        <div className={Classes.DIALOG_FOOTER_ACTIONS}>
          <Button
            intent={Intent.PRIMARY}
            loading={isSubmitting}
            onClick={() => submitForm()}
          >
            Continue to Payment
          </Button>
          <Button onClick={handleCloseBtn}>Cancel</Button>
        </div>
      </div>
    </>
  );
}

const useDefaultExcessPaymentDeposit = () => {
  const { accounts } = usePaymentMadeFormContext();
  return useMemo(() => {
    return accounts?.find((a) => a.slug === DEFAULT_ACCOUNT_SLUG)?.id;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};
