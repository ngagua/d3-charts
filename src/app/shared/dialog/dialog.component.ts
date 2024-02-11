import { Component, Inject } from '@angular/core'
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog'
import { MatButtonModule } from '@angular/material/button'

@Component({
    selector: 'app-dialog',
    templateUrl: 'dialog.component.html',
    styleUrls: ['./dialog.component.scss'],
    standalone: true,
    imports: [MatButtonModule],
})
export class DialogComponent {
    constructor(
        @Inject(DIALOG_DATA) public data: any,
        public dialogRef: DialogRef<string>
    ) {}
}
