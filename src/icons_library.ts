import {library} from "@fortawesome/fontawesome-svg-core";
import {
    faCaretDown,
    faCaretRight,
    faCarSide,
    faFloppyDisk,
    faPen,
    faPlus,
    faRotateLeft,
    faRotateRight,
    faTrashCan,
} from "@fortawesome/free-solid-svg-icons";

export function addIconsToLibrary() {
    library.add(faPlus);
    library.add(faCaretDown);
    library.add(faCaretRight);
    library.add(faCarSide);
    library.add(faRotateLeft);
    library.add(faRotateRight);
    library.add(faFloppyDisk);
    library.add(faPen);
    library.add(faTrashCan);
}
