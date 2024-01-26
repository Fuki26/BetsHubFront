import {Modal as MUIModal} from '@mui/material';
import { dateTimeHelper, } from '../../utils/date';
import { BetsHistoryItemModel, } from '../../models';
import './Modal.css';


interface ModalProps {
    open: boolean;
    handleClose: () => void;
    betsHistory: {
        betId: number;
        insertStatement: string;
        history: Array<BetsHistoryItemModel>;
    };
}

const Modal = ({open, handleClose, betsHistory}: ModalProps) => {
    return (
        <MUIModal
            open={open}
            onClose={handleClose}
        >
            <ul className='wrapper'>
                {
                    betsHistory.insertStatement
                }
                {
                    betsHistory.history.map(({id, field, oldValue, newValue, userName, operation, operationDate}: BetsHistoryItemModel) => {
                        return (
                            <ol key={id}>
                                Changed field: {field || 'Unknown'}, from {oldValue || 'Missing value'} to {newValue || 'Missing value'}. By { userName  || 'Unknown'}. Operation type {operation}. Date {dateTimeHelper(operationDate)}
                            </ol>
                        );
                    })
                }
            </ul>
        </MUIModal>
    );
}

export default Modal;