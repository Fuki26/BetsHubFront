import { useEffect, useState } from "react";

const useSession = () => {
    const [alreadyFocused, setAlreadyFocused] = useState(false);
    const [activeTime, setActiveTime] = useState(0);
    let lastActiveTime = Date.now();

    useEffect(() => {
        const windowFocusEventHandler = () => {
            if (!alreadyFocused) {
                lastActiveTime = Date.now();
                console.log('windowFocusEventHandler');
                setAlreadyFocused(true);
            }
        }
        const windowBlurEventHandler = () => {
            if (!document.hidden) return;
            const elapsedSeconds = Math.floor((Date.now() - lastActiveTime) / 1000);
            setActiveTime(activeTime => activeTime + elapsedSeconds);
            console.log('windowBlurEventHandler');
            setAlreadyFocused(false);
            localStorage.setItem('activeTime', elapsedSeconds.toString());
        }

        window.addEventListener('focus', windowFocusEventHandler, true);
        window.addEventListener('visibilitychange', windowBlurEventHandler, true);

        return () => {
            window.removeEventListener('focus', windowFocusEventHandler);
            window.removeEventListener('visibilitychange', windowBlurEventHandler);
        }
    }, [alreadyFocused]);
}

export default useSession;