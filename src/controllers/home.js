class HomeCtl {
    upload(ctx) {
        console.log(ctx.request.files, "ctx.request.files is")
        const file = ctx.request.files.file;
        ctx.body = {
            url: `${ctx.origin}/${file.newFilename}`
        }
    }
}

module.exports = new HomeCtl();
