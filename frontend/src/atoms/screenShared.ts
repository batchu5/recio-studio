import { atom } from "recoil";
type screenShareProps = {
    userId: string,
    isScreenShare: boolean
}
export const screenShareAtom = atom<screenShareProps[]>({
    key: "screenShare",
    default: [],

})