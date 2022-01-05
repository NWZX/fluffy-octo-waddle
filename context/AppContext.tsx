import React, {
    createContext,
    ReactNode,
    useContext,
    useEffect,
    useReducer
} from 'react';
import { getPlatformId } from '../data/useData';

interface IAppContext {
    platformId?: string;
}

const initialState: IAppContext = {
    platformId: undefined
};

type TActionType = 'platform-id';
interface IReducerAction {
    type: TActionType;
    payload?: Record<string, any>;
}

function reducer(state: IAppContext, action: IReducerAction): IAppContext {
    switch (action.type) {
        case 'platform-id':
            return { ...state, ...action.payload };
        default:
            throw new Error();
    }
}

const AppContext = createContext<
    [IAppContext, (type: TActionType, payload?: Record<string, any>) => void]
>([initialState, () => {}]);

export const AppContextProvider = ({
    children
}: {
    children: ReactNode;
}): JSX.Element => {
    const [data, dispatchData] = useReducer(reducer, initialState);

    //Auto refresh the context if the user is auth
    useEffect(() => {
        (async () => {
            const platformId = await getPlatformId();
            dispatchData({
                type: 'platform-id',
                payload: {
                    platformId: platformId
                } as IAppContext
            });
        })();
    }, []);

    // const groupDispatch = (data: IReducerAction[]) => {
    //     data.forEach((v) => dispatchData(v));
    // };
    return (
        <AppContext.Provider
            value={[data, (t, p) => dispatchData({ type: t, payload: p })]}
        >
            {children}
        </AppContext.Provider>
    );
};

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const useAppContext = () => {
    const [context, dispatch] = useContext(AppContext);

    return { ...context };
};
