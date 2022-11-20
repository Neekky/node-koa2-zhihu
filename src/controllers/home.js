class HomeCtl {
    upload(ctx) {
        console.log(ctx.request.files, "ctx.request.files is")
        const file = ctx.request.files.file;
        ctx.body = {
            path: file.path
        }
    }
}

module.exports = new HomeCtl();
