import { redirect } from "next/navigation";

/** The deep-dive index lives on the home page. */
export default function WritingIndex() {
  redirect("/#writing");
}
