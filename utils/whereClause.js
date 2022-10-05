class WhereClause {
    
    constructor(base, bigQ) {
        this.base = base;
        this.bigQ = bigQ;
    }

    search() {
        const searchWord = this.bigQ.search ? {
            name: {
                $regex: this.bigQ.search,
                $options: 'i',
            }
        } : {};

        this.base = this.base.find({ ...searchWord });
        return this;
    }
    pager(limit) {
        let currentPage = 1;

        if (this.bigQ.page) {
            currentPage = this.bigQ.page;
        }
        this.base = this.base.limit(limit).skip(limit * (currentPage - 1));
        
        return this;
    }

    filter() {
        const copyQ = { ...this.bigQ };
        delete copyQ.search;
        delete copyQ.page;
        delete copyQ.limit;

        // Convert object to string
        let strOfCopyQ = JSON.stringify(copyQ);
        strOfCopyQ = strOfCopyQ.replace(/\b(gte|lte|gt|lt)\b/g, m => `$${m}`);
        
        const jsonOfCopyQ = JSON.parse(strOfCopyQ);
        this.base = this.base.find(jsonOfCopyQ);

        return this;
    }

}

module.exports = WhereClause;