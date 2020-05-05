export default function CheckRequisition(CheckList: (() => Object)[]) {
    let ErrorList = [];
    CheckList.forEach(Check => {
        let fail = Check();
        if (fail) ErrorList.push(fail)
    });
    return ErrorList
}