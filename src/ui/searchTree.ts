export default function searchTree(predicate, getChildren, treeNode) {
    function search(treeNode) {
        if (!treeNode) {
            return undefined;
        }

        for (let treeItem of treeNode) {
            if (predicate(treeItem)) {
                return treeItem;
            }

            const foundItem = search(getChildren(treeItem));

            if (foundItem) {
                return foundItem;
            }
        }
    }

    return search(treeNode);
}
