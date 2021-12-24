@extends('layouts.app')

@section('content')
<div class="container">
    <div class="row justify-content-center">
        <div class="col-md-8">
            <div class="card">
                <div class="card-header">{{ __('Lista') }}</div>
                <div class="card-body">
                    <form id="form-apply" action="{{ route('checkdata.check') }}" method="POST" enctype="multipart/form-data">
                    {{ csrf_field() }}
                        <div class="form-group">
                            <label for="exampleFormControlFile1">Analise um arquivo</label><br/>
                            <input type="file" class="form-control-file" id="exampleFormControlFile1">
                            <button type="submit" class="btn btn-primary mb-2 mt-2 float-right">Verificar</button>
                        </div>
                    </form>
                    @if (session('status'))
                        <div class="alert alert-success" role="alert">
                            {{ session('status') }}
                        </div>
                    @endif
                </div>
            </div>
        </div>
    </div>
</div>
@endsection
