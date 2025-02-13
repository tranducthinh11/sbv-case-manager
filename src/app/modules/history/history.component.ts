import { AfterViewInit, ChangeDetectorRef, Component, EventEmitter, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Config } from 'datatables.net';
import { Observable } from 'rxjs';
import { NgForm } from '@angular/forms';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';
import { DataTablesResponse, IUserModel, UserService } from 'src/app/_fake/services/user-service';
import { SweetAlertOptions } from 'sweetalert2';
import moment from 'moment';

@Component({
  selector: 'app-history-str',
  templateUrl: './history.component.html',
})
export class HistoryComponent implements OnInit {
  
  isAdvandSearch: boolean = false;

  isCollapsed1 = false;
  isCollapsed2 = true;

  isCollapsed3 = false;

  datatableConfig: Config = {};
  isLoading = false;


  // Reload emitter inside datatable
  reloadEvent: EventEmitter<boolean> = new EventEmitter();

  // Single model
  aUser: Observable<IUserModel>;
  userModel: IUserModel = { id: 0, name: '', email: '', role: '' };

  @ViewChild('noticeSwal')
  noticeSwal!: SwalComponent;

  swalOptions: SweetAlertOptions = {};

  roles$: Observable<DataTablesResponse>;
  constructor(private apiService: UserService) { }

  ngOnInit(): void {

    this.datatableConfig = {
      serverSide: true,
      ajax: (dataTablesParameters: any, callback) => {
        this.apiService.getUsers(dataTablesParameters).subscribe(resp => {
          callback(resp);
        });
      },
      columns: [
        {
          title: 'Name', data: 'name', render: function (data, type, full) {
            const colorClasses = ['success', 'info', 'warning', 'danger'];
            const randomColorClass = colorClasses[Math.floor(Math.random() * colorClasses.length)];

            const initials = data[0].toUpperCase();
            const symbolLabel = `
              <div class="symbol-label fs-3 bg-light-${randomColorClass} text-${randomColorClass}">
                ${initials}
              </div>
            `;

            const nameAndEmail = `
              <div class="d-flex flex-column" data-action="view" data-id="${full.id}">
                <a href="javascript:;" class="text-gray-800 text-hover-primary mb-1">${data}</a>
                <span>${full.email}</span>
              </div>
            `;

            return `
              <div class="symbol symbol-circle symbol-50px overflow-hidden me-3" data-action="view" data-id="${full.id}">
                <a href="javascript:;">
                  ${symbolLabel}
                </a>
              </div>
              ${nameAndEmail}
            `;
          }
        },
        {
          title: 'Role', data: 'role', render: function (data, type, row) {
            const roleName = row.roles[0]?.name;
            return roleName || '';
          },
          orderData: [1],
          orderSequence: ['asc', 'desc'],
          type: 'string',
        },
        {
          title: 'Last Login', data: 'last_login_at', render: (data, type, full) => {
            const date = data || full.created_at;
            const dateString = moment(date).fromNow();
            return `<div class="badge badge-light fw-bold">${dateString}</div>`;
          }
        },
        {
          title: 'Joined Date', data: 'created_at', render: function (data) {
            return moment(data).format('DD MMM YYYY, hh:mm a');;
          }
        }
      ],
      createdRow: function (row, data, dataIndex) {
        $('td:eq(0)', row).addClass('d-flex align-items-center');
      },
    };
  }


  toggleAdvanceSearch() {
    this.isAdvandSearch = !this.isAdvandSearch;  
  }

  create() {
    this.userModel = { id: 0, name: '', email: '', };
  }

  delete(id: number) {
    this.apiService.deleteUser(id).subscribe(() => {
      this.reloadEvent.emit(true);
    });
  }

  edit(id: number) {
    this.aUser = this.apiService.getUser(id);
    this.aUser.subscribe((user: IUserModel) => {
      this.userModel = user;
    });
  }

  onSubmit(event: Event, myForm: NgForm) {
    if (myForm && myForm.invalid) {
      return;
    }
  }


  
}
