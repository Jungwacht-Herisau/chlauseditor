import {library} from "@fortawesome/fontawesome-svg-core";
import {faCaretDown, faCaretRight, faPlus} from "@fortawesome/free-solid-svg-icons";

export function addIconsToLibrary() {
  library.add(faPlus);
  library.add(faCaretDown);
  library.add(faCaretRight);
}
