/**
 * Creates a scoped weakSet to prevent recursive references. This is useful for preventing infinite loops when traversing a anything that might contain circular references.
 * @returns a function that returns true if the segment is not in the weakSet, and adds it to the weakSet if it is not.
 * @example Have your recursive function accept the check function as an optional parameter and check if it exists; if it does not, instantiate a new one. This will prevent the need to pass the check function through every recursive call.
 * Then check the object before recursing into it.
 * ```
 * const mySampleFunction = (key: T, check: (T)=>boolean = antiRecursiveReferenceGenerator<T>()) : key => {
 *    if (!check(key)) {
 *       return key;
 *    }
 *   // do stuff
 * ```
 */

export const antiRecursiveReferenceGenerator = <T extends object = object>() => {
    const weakSet = new WeakSet<T>();
    return (key: T): boolean => {
        if (weakSet.has(key)) {
            return false;
        }
        weakSet.add(key);
        return true;
    };
};
