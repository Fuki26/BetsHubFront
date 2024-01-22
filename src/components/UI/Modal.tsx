import {Modal as MUIModal} from '@mui/material';
import { dateTimeHelper, } from '../../utils/date';
import { BetsHistoryItemModel, } from '../../models';
import './Modal.css';


interface ModalProps {
    open: boolean;
    handleClose: () => void;
    betsHistory: Array<BetsHistoryItemModel>;
}

const Modal = ({open, handleClose, betsHistory}: ModalProps) => {
    return (
        <MUIModal
            open={open}
            onClose={handleClose}
        >
            <ul className='wrapper'>
                {
                    betsHistory.map(({id, field, oldValue, newValue, userName, operation, operationDate}: BetsHistoryItemModel) => {
                        if(operation && operation === 'Insert') {
                            return (
                                <ol key={id}>
                                    The row is created at {dateTimeHelper(operationDate)}
                                </ol>
                            );
                        } else {
                            return (
                                <ol key={id}>
                                    Changed field: {field || 'Unknown'}, from {oldValue || 'Missing value'} to {newValue || 'Missing value'}. By { userName  || 'Unknown'}. Operation type {operation}. Date {dateTimeHelper(operationDate)}
                                </ol>
                            );
                        }
                    })
                }
            </ul>
        </MUIModal>
    );
}

export default Modal;