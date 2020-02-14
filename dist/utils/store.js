/**
 * 对象所有方法(除了构造函数),当currPage传入page的this时,即代表数据可以和页面映射
 * 但页面必须存在:以下两个字段
 * store   : ['a'] // 自动映射Store对象里的a数据,映射到page的this.data.a上
 * mixStore: ['debug'] // 自动映射Store对象里的a数据,映射到page的this.mix.a上
 */
class Store {

    constructor(data = {}) {
        this.storeMap = {...data};
    }

    checkedKey(key) {
        if (key === false || key === void 0 || key === null || !isNaN(key) || key.length === 0) return false;
        return true;
    }

    /**
     * 新增Store
     * @param data
     */
    add(data, currPage) {
        Object.keys(data).forEach(key => {
            if (!this.checkedKey(key)) return;
            this.storeMap[key] = data[key];
        });
        this.updateStore(currPage);
        return this;
    }

    /**
     * 设置Store
     * @param key
     * @param value
     */
    set(key, value, currPage) {
        if (!this.checkedKey(key)) return;
        this.storeMap[key] = value;
        this.updateStore(currPage);
        return this;
    }

    /**
     * 清空store
     * @param currPage
     * @returns {Store}
     */
    clear(currPage) {
        this.storeMap = {};
        this.updateStore(currPage);
        return this;
    }

    /**
     * 删除store里面值
     * @param key
     */
    delete(key = null, currPage) {
        if (!this.checkedKey(key)) return;
        try {
            delete this.storeMap[key];
        } catch (e) {
            console.error(
                `删除key:${key}失败,出现错误`
            );
        }
        this.updateStore(currPage);
    }

    /**
     * 更新页面上data里 映射 的数据
     * @param currPage
     */
    updatePageData(currPage) {
        let obj      = {};
        let storeMap = this.storeMap;
        let store    = currPage.hasOwnProperty('store') ? currPage.store : null;
        if (!store) return;
        store.forEach(key => {
            if (!this.checkedKey(key)) return;
            obj[key] = storeMap.hasOwnProperty(key) ? storeMap[key] : undefined;
        });
        currPage.$setData(obj);
    }

    /**
     * 更新页面上mix里 映射 的数据
     * @param currPage
     */
    updatePageMix(currPage) {
        let storeMap = this.storeMap;
        let mixStore = currPage.hasOwnProperty('mixStore') ? currPage.mixStore : null;
        if (!mixStore) return;
        mixStore.forEach(key => {
            if (!this.checkedKey(key)) return;
            currPage.mix[key] = storeMap.hasOwnProperty(key) ? storeMap[key] : undefined;
        });
    }

    /**
     * 更新Store和page上 映射 的数据
     * @param currPage
     */
    updateStore(currPage = null) {
        if (!currPage) return;
        this.updatePageData(currPage);
        this.updatePageMix(currPage);
    }
}

export default Store;