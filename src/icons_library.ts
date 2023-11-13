import {library} from "@fortawesome/fontawesome-svg-core";
import {
  faBug,
  faCaretDown,
  faCaretRight,
  faCarSide,
  faCheck,
  faFileCircleMinus,
  faFileCirclePlus,
  faFilePen,
  faFloppyDisk,
  faPen,
  faPlus,
  faRightFromBracket,
  faRotateLeft,
  faRotateRight,
  faScissors,
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
  library.add(faFilePen);
  library.add(faFileCirclePlus);
  library.add(faFileCircleMinus);
  library.add(faBug);
  library.add(faRightFromBracket);
  library.add(faCheck);
  library.add(faScissors);
}
