import {Modal as MUIModal} from '@mui/material';
import { dateTimeHelper } from '../../utils/date';
import './Modal.css';

interface BetsHistory {
    id: number;
    betId: number;
    field?: string;
    oldValue?: string;
    newValue?: string;
    operation?: string;
    operationDate?: string;
};

interface ModalProps {
    open: boolean;
    handleClose: () => void;
    betsHistory: BetsHistory[];
}

const Modal = ({open, handleClose, betsHistory}: ModalProps) => {
    return (
        <MUIModal
            open={open}
            onClose={handleClose}
        >
            <ul className='wrapper'>
                {betsHistory.map(({id, field, oldValue, newValue, operation, operationDate}: BetsHistory) => {
                    return (
                        <ol key={id}>
                            Changed field: {field || 'Unknown'}, from {oldValue || 'Missing value'} to {newValue || 'Missing value'}. Operation type {operation}. Date {dateTimeHelper(operationDate)}
                        </ol>
                    )
                })}
            </ul>
        </MUIModal>
    );
}

export default Modal;