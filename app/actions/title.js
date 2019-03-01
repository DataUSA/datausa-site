/** */
export function updateTitle(title) {
  return function(dispatch) {
    dispatch({type: "TITLE_UPDATE", data: title});
  };
}
